#!/bin/bash

echo "=========================================="
echo "  限流测试：1分钟最多 3 次请求"
echo "=========================================="
echo ""

URL="http://localhost:3000/api/v1/test/rate-limit"

for i in {1..6}; do
  echo "--- 请求 #$i ---"
  
  response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$URL")
  
  http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
  body=$(echo "$response" | grep -v "HTTP_CODE:")
  
  echo "状态码: $http_code"
  echo "响应: $body" | jq -r '.message // .code' 2>/dev/null || echo "$body"
  
  # 获取限流相关响应头
  headers=$(curl -s -I "$URL" 2>/dev/null)
  remaining=$(echo "$headers" | grep -i "ratelimit-remaining" | cut -d: -f2 | tr -d ' \r')
  limit=$(echo "$headers" | grep -i "ratelimit-limit" | cut -d: -f2 | tr -d ' \r')
  
  if [ -n "$remaining" ]; then
    echo "限流信息: 剩余 $remaining / $limit 次"
  fi
  
  echo ""
  sleep 0.5
done

echo "=========================================="
echo "  测试完成！前3次应该成功，后3次应该被限流"
echo "=========================================="
