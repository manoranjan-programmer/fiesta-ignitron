#!/bin/bash

# Quick setup script for Fiesta Ignitron

echo "🚀 Fiesta Ignitron Setup"
echo "========================"

# Backend setup
echo -e "\n📦 Setting up backend..."
cd backend
cp .env.example .env
npm install

# Frontend setup  
echo -e "\n📦 Setting up frontend..."
cd ../frontend
cp .env.example .env
npm install

echo -e "\n✅ Setup complete!"
echo -e "\n📖 Next steps:"
echo "1. Edit backend/.env with your MongoDB URI and Google OAuth keys"
echo "2. Run: docker-compose up (for MongoDB)"
echo "3. Run: cd backend && npm start"
echo "4. Run: cd frontend && npm run dev"
echo -e "\n📚 See DEPLOYMENT.md for full production deployment guide"
