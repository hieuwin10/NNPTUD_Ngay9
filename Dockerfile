# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Chỉ copy package files để tận dụng cache của Docker
COPY package*.json ./

# Tắt kiểm tra phiên bản engine để tránh lỗi v18
RUN echo "engine-strict=false" > .npmrc

# Cài đặt tất cả dependencies
RUN npm install

# Copy toàn bộ code nguồn
COPY . .

# Stage 2: Runtime stage
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy các dependencies từ stage builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
# Copy code nguồn từ stage builder
COPY --from=builder /usr/src/app .

# Lược bỏ các file rác nếu cần thiết

EXPOSE 3000

CMD ["node", "./bin/www"]
