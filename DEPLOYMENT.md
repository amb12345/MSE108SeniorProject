# Deploying to GitHub Pages

## Prerequisites
- Your code should be in a GitHub repository
- Repository name should be `MSE108SeniorProject` (or update `basePath` in `next.config.mjs`)

## Steps to Deploy

### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Prepare for GitHub Pages deployment"
git push origin main
```

### 2. Enable GitHub Pages in Repository Settings

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/MSE108SeniorProject`
2. Click on **Settings** tab
3. In the left sidebar, click **Pages**
4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
5. Save the settings

### 3. Automatic Deployment

Once you've enabled GitHub Pages:
- The GitHub Actions workflow will automatically run when you push to `main`
- You can monitor the deployment progress in the **Actions** tab
- After successful deployment (usually 2-5 minutes), your site will be live at:
  
  ```
  https://YOUR_USERNAME.github.io/MSE108SeniorProject/
  ```

### 4. Manual Deployment (Optional)

You can also trigger deployment manually:
1. Go to the **Actions** tab in your repository
2. Click on "Deploy to GitHub Pages" workflow
3. Click "Run workflow" button
4. Select the branch (main) and click "Run workflow"

## Local Testing Before Deployment

To test the production build locally:

```bash
# Build the static export
npm run build

# The output will be in the 'out' folder
# You can serve it with any static file server, for example:
npx serve out
```

## Troubleshooting

### Site Not Loading / 404 Error
- Make sure the repository name matches the `basePath` in `next.config.mjs`
- Check that GitHub Pages is set to use "GitHub Actions" as the source
- Wait a few minutes after the first deployment

### Workflow Failed
- Check the Actions tab for error messages
- Ensure all dependencies are listed in `package.json`
- Make sure `package-lock.json` is committed

### Images Not Loading
- Images should be in the `public` folder
- Use paths starting with `/MSE108SeniorProject/` in production
- The config already handles this automatically

## Custom Domain (Optional)

If you want to use a custom domain:
1. Add a `CNAME` file in the `public` folder with your domain
2. Configure your domain's DNS settings to point to GitHub Pages
3. Update the `basePath` in `next.config.mjs` to `''`

## Environment Variables

GitHub Pages only supports static sites. If you need API keys or secrets:
- They must be embedded at build time (not secure for sensitive data)
- Consider using a backend service or Vercel for apps requiring server-side secrets

## Notes

- This is a **static export** - no server-side features
- The site updates automatically when you push to main
- First deployment may take 5-10 minutes
- Subsequent deployments are usually faster (2-3 minutes)
