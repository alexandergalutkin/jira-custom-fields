## Требования
`node -v` // 20.17.0

## Ручная сборка
1. `yarn install`
2. `yarn webpack`
3. Скопировать из `dist/dist.js` в новый скрипт `Tampermonkey`

## Release версия
Можно взять [последнюю версию релиза](https://github.com/alexandergalutkin/jira-custom-fields/releases) и вставить в новый (если ещё не был создан) скрипт или обновить старый

## Создание нового скрипта в Tampermonkey
1. Переходим в расширение, нажимаем "Создать новый скрипт"\
![image](https://github.com/user-attachments/assets/7d311b89-f93e-4a24-8ec5-b4e7e2d2d7df)
2. В открывшейся вкладке удаляем всё содержимое и вставляем нужный нам скрипт (из ручной сборки или release версии)
3. Сохраняем
