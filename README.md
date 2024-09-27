## Требования
`node -v` // 20.17.0\
Установить `tampermonkey` как расширение в свой браузер // [брать отсюда (кликабельно)](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

## Release версия
Заходите в список [последних версий релиза](https://github.com/alexandergalutkin/jira-custom-fields/releases) и нажимаете на `dist.user.js`

![image](https://github.com/user-attachments/assets/76878e6e-2c55-494f-a130-c589e144cb58)

Отобразится окно `Tampermonkey`, где необходимо нажать кнопку `Установить` (или `Переустановить`, если эта версия у вас уже была установлена)

![image](https://github.com/user-attachments/assets/767f763e-d542-48b6-b384-0673cd847172)


## Ручная сборка
1. `yarn install`
2. `yarn webpack`
3. Скопировать из `dist/dist.js` в новый скрипт `Tampermonkey`

## Создание нового скрипта в Tampermonkey
1. Переходим в расширение, нажимаем "Создать новый скрипт"\
![image](https://github.com/user-attachments/assets/7d311b89-f93e-4a24-8ec5-b4e7e2d2d7df)
2. В открывшейся вкладке удаляем всё содержимое и вставляем нужный нам скрипт (из ручной сборки или release версии)
3. Сохраняем
