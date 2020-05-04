Cette application permet de récupérer et controler votre pompe à chaleur via le controleur madoka

### Installation

```
npm install
```

## Démarrage

```
sudo node index.js [port web]
```

## Utilisation

L'application crée une api web afin de récupérer les informations via des requetes http.

- Récuperer la vitesse du ventilateur
```
/device/:devicemac/fanspeed
```

- Changer la vitesse du ventilateur
```
/device/:devicemac/fanspeed/heat/:value
/device/:devicemac/fanspeed/cold/:value
```

- Récuperer les consignes
```
/device/:devicemac/setpoint
```

- Changer les consignes
```
/device/:devicemac/setpoint/heat/:value
/device/:devicemac/setpoint/cold/:value
```

- Récuperer le mode de marche
```
/device/:devicemac/operationmode
```

- Changer le mode de marche
```
/device/:devicemac/operationmode/set/:value
```

- Récuperer l'état de marche
```
/device/:devicemac/settingstatus
```

- Démarrer ou arreter la pompe à chaleur
```
/device/:devicemac/settingstatus/set/:value
```

- Récuperer les informations générales
```
/device/:devicemac/generalinfo
```

- Récuperer les valeurs des sondes de température
```
/device/:devicemac/sensorinformation
```

- Récuperer les versions de firmware
```
/device/:devicemac/maintenanceinformation
```

Toutes les valeurs sont décrites sur ce dépot [blafois/Daikin-Madoka-BRC1H-BLE-Reverse](https://github.com/blafois/Daikin-Madoka-BRC1H-BLE-Reverse)

### Credits

- [blafois/Daikin-Madoka-BRC1H-BLE-Reverse](https://github.com/blafois/Daikin-Madoka-BRC1H-BLE-Reverse) pour le reverse du controleur

## License

```
The MIT License

Copyright (c) 2020 mathman - https://github.com/mathman/madoka

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
