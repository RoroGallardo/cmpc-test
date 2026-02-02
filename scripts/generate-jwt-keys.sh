#!/bin/bash

# Script para generar claves RSA para JWT

echo "Generando par de claves RSA 4096 bits..."

# Generar clave privada
openssl genrsa -out jwt.private.pem 4096

# Generar clave pública
openssl rsa -in jwt.private.pem -pubout -out jwt.public.pem

echo ""
echo "✅ Claves generadas exitosamente!"
echo ""
echo "Copia las siguientes líneas en tu archivo .env:"
echo ""
echo "JWT_PRIVATE_KEY=\"$(awk '{printf "%s\\n", $0}' jwt.private.pem)\""
echo ""
echo "JWT_PUBLIC_KEY=\"$(awk '{printf "%s\\n", $0}' jwt.public.pem)\""
echo ""
echo "Archivos generados:"
echo "- jwt.private.pem (⚠️  MANTENER EN SECRETO)"
echo "- jwt.public.pem (puede compartirse)"
echo ""
echo "⚠️  IMPORTANTE: Elimina los archivos .pem después de copiar al .env"

# Limpiar archivos
rm jwt.private.pem jwt.public.pem
