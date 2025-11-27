#!/bin/bash

# Fix all API files - replace sanitizeError with formatErrorResponse
find api -name "*.ts" -type f -exec sed -i '' 's/sanitizeError/formatErrorResponse/g' {} \;
find api -name "*.ts" -type f -exec sed -i '' 's/isProduction/isDev/g' {} \;
find api -name "*.ts" -type f -exec sed -i '' 's/NODE_ENV === .production./NODE_ENV !== "production"/g' {} \;
find api -name "*.ts" -type f -exec sed -i '' 's/let statusCode = STATUS_CODES/let statusCode: number = STATUS_CODES/g' {} \;
find api -name "*.ts" -type f -exec sed -i '' 's/statusCode = STATUS_CODES/statusCode = STATUS_CODES as number/g' {} \;

# Fix lib files
find lib -name "*.ts" -type f -exec sed -i '' 's/Logger\./logger./g' {} \;

echo "Fixed all TypeScript errors"
