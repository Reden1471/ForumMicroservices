#!/bin/bash
echo "📦 Installing Forum App desktop shortcuts..."

# Get the current directory
PROJECT_DIR=$(pwd)
DESKTOP_DIR="$HOME/Desktop"

# Create the start script
cat > "$PROJECT_DIR/start-forum.sh" << 'EOF'
#!/bin/bash
echo "🚀 Starting Forum Microservices..."

# Change to project directory
cd "$(dirname "$0")"

# Build and start everything
docker-compose down
docker-compose up --build -d

echo "⏳ Waiting for services to initialize..."
sleep 30

echo "All services are starting!"
echo ""
echo "Frontend: http://localhost:7006"
echo "API: http://localhost:7000"
echo ""
echo "To stop the application, use the 'Stop Forum App' desktop shortcut."
EOF

# Create the stop script
cat > "$PROJECT_DIR/stop-forum.sh" << 'EOF'
#!/bin/bash
echo "🛑 Stopping Forum Microservices..."

# Change to project directory
cd "$(dirname "$0")"

# Stop everything
docker-compose down

echo "All services stopped!"
echo ""
echo "To start again, use the 'Start Forum App' desktop shortcut."
EOF

# Create the start desktop file
cat > "$DESKTOP_DIR/start-forum.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Start Forum App
Comment=Start the Forum Microservices Application
Exec=gnome-terminal --working-directory=$PROJECT_DIR -e 'bash -c "./start-forum.sh; bash"'
Icon=utilities-terminal
Terminal=false
StartupNotify=true
Categories=Development;
EOF

# Create the stop desktop file
cat > "$DESKTOP_DIR/stop-forum.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Stop Forum App
Comment=Stop the Forum Microservices Application
Exec=gnome-terminal --working-directory=$PROJECT_DIR -e 'bash -c "./stop-forum.sh; bash"'
Icon=utilities-terminal
Terminal=false
StartupNotify=true
Categories=Development;
EOF

# Make scripts executable
chmod +x "$PROJECT_DIR/start-forum.sh"
chmod +x "$PROJECT_DIR/stop-forum.sh"
chmod +x "$DESKTOP_DIR/start-forum.desktop"
chmod +x "$DESKTOP_DIR/stop-forum.desktop"

echo "Desktop shortcuts installed!"
echo "Start: $DESKTOP_DIR/start-forum.desktop"
echo "Stop: $DESKTOP_DIR/stop-forum.desktop"
echo ""
echo "Double-click 'Start Forum App' to start the application"
echo "Double-click 'Stop Forum App' to stop the application"