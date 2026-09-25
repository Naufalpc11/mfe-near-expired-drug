@echo off
echo Building views...
cd views
call npm run build
cd ..

echo Publishing addon...
npx alurkerja-cli addon publish

pause