const loaderState={promise:null,key:null};
function loadGoogleMaps(apiKey){
  if(globalThis.google?.maps?.importLibrary)return Promise.resolve(globalThis.google.maps);
  if(!apiKey)throw new Error('Google Maps API key non configurata.');
  if(loaderState.promise&&loaderState.key===apiKey)return loaderState.promise;
  loaderState.key=apiKey;
  loaderState.promise=new Promise((resolve,reject)=>{
    const callback=`__spurgoMapsReady_${Date.now()}`;
    globalThis[callback]=()=>{delete globalThis[callback];resolve(globalThis.google.maps)};
    const script=document.createElement('script');
    script.async=true;script.defer=true;
    script.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async&callback=${callback}`;
    script.onerror=()=>{delete globalThis[callback];reject(new Error('Google Maps non disponibile.'))};
    document.head.append(script);
  });
  return loaderState.promise;
}
const point=value=>value?.coordinates&&Number.isFinite(value.coordinates.latitude)&&Number.isFinite(value.coordinates.longitude)?{lat:value.coordinates.latitude,lng:value.coordinates.longitude}:String([value?.address,value?.city].filter(Boolean).join(', ')).trim();
export class GoogleMapsService{
  constructor({apiKey,enabled=true}={}){this.apiKey=apiKey;this.enabled=enabled!==false&&Boolean(apiKey)}
  isConfigured(){return this.enabled}
  async ready(){if(!this.enabled)throw new Error('Google Maps non configurato.');return loadGoogleMaps(this.apiKey)}
  async geocode(address){const maps=await this.ready();const{Geocoder}=await maps.importLibrary('geocoding');const response=await new Geocoder().geocode({address});const first=response.results?.[0];if(!first)throw new Error('Indirizzo non trovato su Google Maps.');const loc=first.geometry.location;return{latitude:loc.lat(),longitude:loc.lng(),formattedAddress:first.formatted_address,placeId:first.place_id}}
  async route(origin,destination,{departureTime=new Date(),traffic=true}={}){
    const maps=await this.ready();const{Route}=await maps.importLibrary('routes');
    const request={origin:point(origin),destination:point(destination),travelMode:'DRIVING',routingPreference:traffic?'TRAFFIC_AWARE':'TRAFFIC_UNAWARE',departureTime,language:'it',units:'METRIC',fields:['durationMillis','distanceMeters','path','viewport','localizedValues']};
    const result=await Route.computeRoutes(request),route=result.routes?.[0];if(!route)throw new Error('Percorso Google Maps non disponibile.');
    return{durationMinutes:Math.max(1,Math.ceil((route.durationMillis??0)/60000)),distanceKm:Math.round(((route.distanceMeters??0)/1000)*10)/10,path:route.path??[],viewport:route.viewport??null,route};
  }
  async matrix(origins,destinations,{departureTime=new Date(),traffic=true}={}){
    const maps=await this.ready();const{RouteMatrix}=await maps.importLibrary('routes');
    const result=await RouteMatrix.computeRouteMatrix({origins:origins.map(point),destinations:destinations.map(point),travelMode:'DRIVING',routingPreference:traffic?'TRAFFIC_AWARE':'TRAFFIC_UNAWARE',departureTime,language:'it',units:'METRIC',fields:['durationMillis','distanceMeters','condition']});
    return result.matrix.rows.map(row=>row.items.map(item=>({durationMinutes:Number.isFinite(item.durationMillis)?Math.max(1,Math.ceil(item.durationMillis/60000)):null,distanceKm:Number.isFinite(item.distanceMeters)?Math.round(item.distanceMeters/100)/10:null,condition:item.condition})));
  }
  async render(container,{center,markers=[],path=[]}={}){
    if(!container)return;const maps=await this.ready();const[{Map},{AdvancedMarkerElement}]=await Promise.all([maps.importLibrary('maps'),maps.importLibrary('marker')]);
    const fallback=center??markers[0]?.position??{lat:45.65,lng:9.95};const map=new Map(container,{center:fallback,zoom:12,mapTypeControl:false,streetViewControl:false,fullscreenControl:true,mapId:'DEMO_MAP_ID'});
    for(const marker of markers)new AdvancedMarkerElement({map,position:marker.position,title:marker.title??''});
    if(path?.length){await maps.importLibrary('geometry');const poly=new maps.Polyline({map,path,strokeOpacity:.85,strokeWeight:5});const bounds=new maps.LatLngBounds();path.forEach(p=>bounds.extend(p));map.fitBounds(bounds);}
    return map;
  }
}
