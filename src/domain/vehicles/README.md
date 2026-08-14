# Vehicles domain

The alpha.5 operational model retains the alpha.2 schema: required `id`, `plate`,
`active`, `createdAt`, and `updatedAt`, with optional string fields `name`, `type`,
and `notes`. Vehicle type remains an open string; no persistent enum is defined.
