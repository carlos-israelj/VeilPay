# VeilPay x402 - Despliegue Rápido en Render

## Pasos para Desplegar:

### 1. Preparar Repositorio

```bash
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/Stacks/VeilPay

# Agregar todos los cambios
git add .

# Commit
git commit -m "Add x402 multi-asset support for Stacks

- Added veilpay-usdcx contract (USDCx privacy pool)
- Added veilpay-sbtc-v2 contract (sBTC privacy pool - FIRST Bitcoin privacy on Stacks!)
- Added x402 middleware for programmatic payments
- Added multi-asset support (STX, USDCx, sBTC)
- Added Render deployment configuration
- Fixed getRoot() method bug in multi-asset.js

Deployed contracts:
- ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-usdcx
- ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-sbtc-v2

Relayer features:
- ZK-SNARK proof verification (Groth16)
- HTTP 402 Payment Required (x402 protocol v2)
- Privacy-preserving payments
- Multi-asset privacy pools"

# Push a GitHub
git push origin main
```

### 2. Crear Servicio en Render

1. **Ir a:** https://dashboard.render.com
2. **Click:** "New +" → "Web Service"
3. **Conectar:** Repositorio `carlos-israelj/VeilPay`
4. **Configurar:**
   - Name: `veilpay-x402-relayer`
   - Region: `Oregon`
   - Build Command: `cd relayer && npm install`
   - Start Command: `cd relayer && npm start`
   - Plan: `Starter` (o `Free` para pruebas)

### 3. Configurar Variables de Entorno

**IMPORTANTE:** En Environment Variables, agregar:

```bash
# CRÍTICO - Debe ser configurado manualmente
RELAYER_PRIVATE_KEY=866b46266fb30bf7a97ed3b2f03774d7d30736ba49d46d7cd1846dfc62cf190f01

# Las demás variables ya están en render.yaml
# Solo necesitas agregar RELAYER_PRIVATE_KEY manualmente
```

### 4. Desplegar

1. Click "Create Web Service"
2. Esperar build (~3-5 minutos)
3. Verificar logs para mensaje de éxito:
   ```
   Ready to process private payments! 🚀
   ```

### 5. Obtener URL Pública

Render asignará una URL como:
```
https://veilpay-x402-relayer.onrender.com
```

### 6. Actualizar X402_BASE_URL

1. En Render Dashboard → Environment Variables
2. Agregar:
   ```bash
   X402_BASE_URL=https://veilpay-x402-relayer.onrender.com
   ```
3. Save (redesplegará automáticamente)

### 7. Probar Despliegue

```bash
# Reemplaza YOUR-URL con tu URL de Render

# Health check
curl https://YOUR-URL.onrender.com/health

# Stats
curl https://YOUR-URL.onrender.com/stats

# x402 Schema
curl https://YOUR-URL.onrender.com/x402/schema

# Test 402
curl -i https://YOUR-URL.onrender.com/x402/demo
```

### 8. Registrar en x402scan

1. Ir a x402scan
2. Registrar con: `https://YOUR-URL.onrender.com/x402/schema`
3. ¡Listo! Tu servicio estará disponible públicamente

---

## Contratos Desplegados (Testnet):

- **veilpay-usdcx:** `ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-usdcx`
- **veilpay-sbtc-v2:** `ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-sbtc-v2`

## Relayer Address:

`ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1`

## Assets Soportados:

- **STX** - 1 STX mínimo (nativo)
- **USDCx** - 1 USDCx mínimo (SIP-010 token)
- **sBTC** - 0.0001 BTC mínimo (10,000 sats)

## Documentación Completa:

Ver `DEPLOY-RENDER.md` para guía detallada con troubleshooting.

---

**Status:** ✅ Listo para desplegar
