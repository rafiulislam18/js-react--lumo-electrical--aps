module.exports = {
  apps: [{
    name: 'frontend',
    script: 'npx',
    args: 'serve dist -s -p 3000',  // Serve dist/ on port 3000, -s for SPA routing
    env: {
      NODE_ENV: 'production',
      PM2_SERVE_PATH: './dist',
      PM2_SERVE_PORT: 3000,
      PM2_SERVE_SPA: 'true'  // Ensures client-side routing works
    },
    instances: 1,  // Use 'max' for clustering if needed
    exec_mode: 'fork'  // 'cluster' if using multiple instances
  }]
};