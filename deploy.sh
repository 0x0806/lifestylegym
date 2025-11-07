#!/bin/bash

# Production Deployment Script for New Lifestyle Gym
# This script automates the deployment process

set -e  # Exit on any error

# Configuration
APP_NAME="lifestyle-gym"
BACKUP_DIR="/var/backups/$APP_NAME"
DEPLOY_USER="deploy"
DEPLOY_SERVER="your-server.com"
REMOTE_DIR="/var/www/$APP_NAME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if running in production mode
if [ "$NODE_ENV" != "production" ]; then
    warn "Not running in production mode. Set NODE_ENV=production for deployment."
fi

# Create backup directory
create_backup() {
    log "Creating backup..."
    sudo mkdir -p $BACKUP_DIR
    BACKUP_NAME="$APP_NAME-$(date +%Y%m%d-%H%M%S)"

    if [ -d "$REMOTE_DIR" ]; then
        sudo cp -r $REMOTE_DIR $BACKUP_DIR/$BACKUP_NAME
        log "Backup created: $BACKUP_DIR/$BACKUP_NAME"
    else
        warn "No existing installation to backup"
    fi
}

# Run tests
run_tests() {
    log "Running tests..."

    # Install dependencies
    npm ci --silent

    # Run tests if available
    if [ -f "package.json" ] && grep -q "test" package.json; then
        npm test
    else
        warn "No tests configured, skipping..."
    fi

    # Run linting if available
    if [ -f "package.json" ] && grep -q "lint" package.json; then
        npm run lint
    fi

    log "Tests completed successfully"
}

# Build application
build_app() {
    log "Building application..."

    # No build process needed for this Node.js app
    # Just ensure dependencies are installed
    npm ci --only=production

    log "Application built successfully"
}

# Deploy to server
deploy_to_server() {
    log "Deploying to server..."

    # Create remote directory structure
    ssh $DEPLOY_USER@$DEPLOY_SERVER "mkdir -p $REMOTE_DIR/{logs,uploads,ssl}"

    # Copy application files
    rsync -avz --exclude-from=.deployignore \
        . $DEPLOY_USER@$DEPLOY_SERVER:$REMOTE_DIR/

    # Set correct permissions
    ssh $DEPLOY_USER@$DEPLOY_SERVER "chmod -R 755 $REMOTE_DIR"
    ssh $DEPLOY_USER@$DEPLOY_SERVER "chown -R www-data:www-data $REMOTE_DIR"

    log "Files deployed successfully"
}

# Deploy with Docker
deploy_with_docker() {
    log "Deploying with Docker..."

    # Build Docker image
    docker build -t $APP_NAME:latest .

    # Save image for transfer
    docker save $APP_NAME:latest | gzip > $APP_NAME-latest.tar.gz

    # Transfer to server
    scp $APP_NAME-latest.tar.gz $DEPLOY_USER@$DEPLOY_SERVER:/tmp/

    # Load image on server and deploy
    ssh $DEPLOY_USER@$DEPLOY_SERVER << EOF
        # Load Docker image
        gunzip -c /tmp/$APP_NAME-latest.tar.gz | docker load

        # Stop existing container
        docker stop $APP_NAME-container 2>/dev/null || true
        docker rm $APP_NAME-container 2>/dev/null || true

        # Run new container
        docker run -d \
            --name $APP_NAME-container \
            --restart unless-stopped \
            -p 5000:5000 \
            -v /var/www/$APP_NAME/uploads:/app/uploads \
            -v /var/www/$APP_NAME/logs:/app/logs \
            --env-file /var/www/$APP_NAME/.env.production \
            $APP_NAME:latest

        # Cleanup
        rm /tmp/$APP_NAME-latest.tar.gz
EOF

    # Clean up local image
    rm $APP_NAME-latest.tar.gz

    log "Docker deployment completed"
}

# Health check
health_check() {
    log "Performing health check..."

    local max_attempts=30
    local attempt=1
    local url="http://$DEPLOY_SERVER/api/health"

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s $url > /dev/null; then
            log "Health check passed!"
            return 0
        fi

        echo "Attempt $attempt/$max_attempts: Service not ready yet..."
        sleep 10
        ((attempt++))
    done

    error "Health check failed after $max_attempts attempts"
    return 1
}

# Post-deployment tasks
post_deploy() {
    log "Running post-deployment tasks..."

    # Clean up old backups (keep last 5)
    if [ -d "$BACKUP_DIR" ]; then
        cd $BACKUP_DIR
        ls -t | tail -n +6 | xargs -r rm -rf
    fi

    # Log deployment
    echo "Deployment completed at $(date)" >> $BACKUP_DIR/deployment.log

    log "Post-deployment tasks completed"
}

# Rollback function
rollback() {
    error "Deployment failed! Starting rollback..."

    if [ -n "$BACKUP_NAME" ] && [ -d "$BACKUP_DIR/$BACKUP_NAME" ]; then
        sudo rm -rf $REMOTE_DIR
        sudo cp -r $BACKUP_DIR/$BACKUP_NAME $REMOTE_DIR
        sudo systemctl restart nginx

        log "Rollback completed successfully"
    else
        error "No backup available for rollback!"
    fi
}

# Main deployment function
main() {
    log "Starting deployment of New Lifestyle Gym..."

    # Trap for rollback on error
    trap 'rollback' ERR

    case "${1:-full}" in
        "backup")
            create_backup
            ;;
        "test")
            run_tests
            ;;
        "build")
            build_app
            ;;
        "deploy")
            create_backup
            run_tests
            build_app
            deploy_to_server
            health_check
            post_deploy
            ;;
        "docker")
            create_backup
            run_tests
            build_app
            deploy_with_docker
            health_check
            post_deploy
            ;;
        "full")
            create_backup
            run_tests
            build_app
            deploy_to_server
            health_check
            post_deploy
            ;;
        "health")
            health_check
            ;;
        *)
            echo "Usage: $0 [backup|test|build|deploy|docker|full|health]"
            echo "  backup  - Create backup only"
            echo "  test    - Run tests only"
            echo "  build   - Build application only"
            echo "  deploy  - Deploy to server without Docker"
            echo "  docker  - Deploy with Docker containers"
            echo "  full    - Complete deployment (default)"
            echo "  health  - Health check only"
            exit 1
            ;;
    esac

    log "Deployment completed successfully! 🎉"
}

# Check dependencies
check_dependencies() {
    local deps=("curl" "rsync" "ssh")

    for dep in "${deps[@]}"; do
        if ! command -v $dep &> /dev/null; then
            error "Required dependency not found: $dep"
            exit 1
        fi
    done
}

# Run deployment
check_dependencies
main "$@"