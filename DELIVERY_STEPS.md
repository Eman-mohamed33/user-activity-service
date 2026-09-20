# Project Delivery Steps

Follow these steps in order.

## 1. Prepare

Install Node.js, npm, Docker Desktop, Postman, a screen recorder with a working microphone, and a GitHub account. Start Docker Desktop.

## 2. Install and build

Open PowerShell in the project root:

```powershell
cd "C:\Users\aharr\OneDrive\Desktop\intern task"
npm install
npm run build
```

The build must finish without errors.

## 3. Start the project

```powershell
npm run start
```

This starts MongoDB and Redpanda with Docker Compose, then starts the TypeScript server. Wait for `[startup] Service is ready`. Keep this terminal open. The API runs at `http://localhost:3000`.

## 4. Check the service

Open another PowerShell window:

```powershell
Invoke-RestMethod http://localhost:3000/health
```

The response should show `status: ok`, MongoDB `connected`, and Kafka `connected`.

## 5. Test with Postman

Import this file:

```text
postman/User Activity Service.postman_collection.json
```

Run the requests in this order:

1. `Health`
2. `Publish Activity Event`
3. `List Logs - Default Page`
4. `List Logs - Filter by User`
5. `List Logs - Filter by Type and Date`
6. `List Logs - Pagination`
7. `Publish Invalid Event`

Wait a few seconds after publishing because Kafka processing is asynchronous.

## 6. Run tests

```powershell
npm test
```

All tests should pass.

## 7. Record the demo

Use clear English voice narration. Show:

1. The project purpose.
2. The TypeScript folder structure.
3. `npm run build`.
4. `npm run start` and the startup logs.
5. The `/health` request.
6. An event published from Postman.
7. The processed event from `/api/logs`.
8. Filtering and pagination.
9. `Dockerfile`, `docker-compose.yml`, and `k8s/`.
10. The limitation that authentication is not implemented.

Make sure your voice is audible throughout the recording.

## 8. Stop local services

```powershell
docker compose down
```

Do not use `docker compose down -v` unless you intentionally want to delete the local MongoDB data volume.

## 9. Check files before publishing

The repository should include `README.md`, `PROJECT_DOCUMENTATION.md`, `DELIVERY_STEPS.md`, `package.json`, `package-lock.json`, `tsconfig.json`, `Dockerfile`, `docker-compose.yml`, `src/`, `test/`, `postman/`, `k8s/`, and `.env.example`.

Do not publish `.env`, `node_modules/`, `dist/`, passwords, or private credentials.

## 10. Create GitHub repository

1. Sign in to GitHub.
2. Create an empty repository named something like `user-activity-service`.
3. Do not add another README.
4. Copy the repository URL.

## 11. Push to GitHub

Run these commands in the project root:

```powershell
git init
git add .
git commit -m "Build event-driven user activity service"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the real URL. Check for secrets before pushing:

```powershell
git status
```

## 12. Submit

Submit the GitHub repository URL, the demo video URL, and mention that documentation is included in `README.md` and `PROJECT_DOCUMENTATION.md`.

Test the video link in a private browser window before submitting.

## Final checklist

- [ ] Build passes.
- [ ] `npm run start` starts the service.
- [ ] `/health` works.
- [ ] Events can be published and retrieved.
- [ ] Filtering and pagination work.
- [ ] Tests pass.
- [ ] Postman collection is included.
- [ ] Documentation is included.
- [ ] Demo has clear English voice narration.
- [ ] GitHub repository is accessible.
- [ ] No secrets are committed.
