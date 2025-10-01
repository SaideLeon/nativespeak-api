#!/bin/bash
set -e

API_URL="https://nativespeak.cognick.qzz.io/api"

# Usuário de teste
EMAIL="teste$(date +%s)@exemplo.com"
PASSWORD="senha123"
FIRSTNAME="João"
LASTNAME="Silva"

echo "🚀 Testando NativeSpeak API em $API_URL"
echo "======================================="

# 1. Registrar usuário
echo -e "\n📌 Registrando usuário..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"firstName\":\"$FIRSTNAME\",\"lastName\":\"$LASTNAME\"}")

echo "Resposta: $REGISTER_RESPONSE"
TOKEN=$(echo $REGISTER_RESPONSE | grep -oP '"token":"\K[^"]+')

if [ -z "$TOKEN" ]; then
  echo "❌ Falha ao registrar usuário"
  exit 1
fi

echo "✅ Token capturado"

# 2. Login
echo -e "\n📌 Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "Resposta: $LOGIN_RESPONSE"

# 3. Obter perfil do usuário
echo -e "\n📌 Obter perfil (/auth/me)..."
curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN"

# 4. Aceitar termos
echo -e "\n📌 Aceitar termos..."
curl -s -X POST "$API_URL/auth/accept-terms" \
  -H "Authorization: Bearer $TOKEN"

# 5. Atualizar perfil
echo -e "\n📌 Atualizar perfil..."
curl -s -X PATCH "$API_URL/users/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"avatar":"https://example.com/avatar.png","theme":"dark"}'

# 6. Atualizar créditos
echo -e "\n📌 Atualizar créditos..."
curl -s -X PATCH "$API_URL/users/credits" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":50}'

# 7. Adicionar tempo de conversação
echo -e "\n📌 Adicionar tempo de conversação..."
curl -s -X POST "$API_URL/users/conversation-time" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"seconds":120}'

# 8. Marcar aula concluída
echo -e "\n📌 Marcar aula concluída..."
curl -s -X POST "$API_URL/users/completed-lessons" \
  -H "Authorization: Bearer $TOKEN"

# 9. Listar progresso de aulas
echo -e "\n📌 Listar progresso de aulas..."
curl -s -X GET "$API_URL/progress/lessons" \
  -H "Authorization: Bearer $TOKEN"

# 10. Criar TODO
echo -e "\n📌 Criar TODO..."
TODO_RESPONSE=$(curl -s -X POST "$API_URL/progress/todos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Estudar inglês","duration":30}')
echo "Resposta: $TODO_RESPONSE"

echo -e "\n✅ Testes finalizados!"
