@echo off
echo Adding all changes to Git...
git add .

echo Committing changes...
git commit -m "Auto-deploy: %date% %time%"

echo Pushing to GitHub...
git push origin devin/1747592774-initial-project-setup

echo Deployment complete!
pause 