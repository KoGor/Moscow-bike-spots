# Места катания на велосипеде в Москве
Московские споты для катания на велосипеде в пределах МКАД. До каждого спота построены маршруты до ближайших входов метро с указанием протяжённости в метрах. Информация по споту и маршруту доступна по клику.

Сайт проекта: [«Места катания на велосипеде в Москве»](http://kogor.github.io/Moscow-bike-spots/).
Проект построен на данных из [OpenStreetMap](https://www.openstreetmap.org) и [Spotmap](http://spotmap.ru/). 

### Технические подробности
На данный момент используются тайлы сервиса [Sputnik](http://maps.sputnik.ru/). Для отрисовки карты используется библиотека [leaflet.js](http://leafletjs.com/) с рядом доработанных плагинов.

Плагины:
- [Leaflet-hash](https://github.com/mlevans/leaflet-hash)
- [Leaflet-fuseSearch](https://github.com/naomap/leaflet-fusesearch)

Маршруты до станций метро посчитаны роутинговым движком [OSRM](http://project-osrm.org/) с помощью замечательного сервиса [MyWay.io](http://myway.io/).

### Лицензия

MIT License. Подробнее в соответствующем файле LICENSE.
