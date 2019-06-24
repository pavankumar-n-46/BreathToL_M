var w;

var myCharacteristic;

var iput = 1;

var dataQueue = [50];




function onStartButtonClick() {

  let serviceUuid = '0xffb0';
  if (serviceUuid.startsWith('0x')) {
    serviceUuid = parseInt(serviceUuid);
  }

  let characteristicUuid = '0xffb3';
  if (characteristicUuid.startsWith('0x')) {
    characteristicUuid = parseInt(characteristicUuid);
  }

  log('Requesting Bluetooth Device...');
  navigator.bluetooth.requestDevice({ filters: [{ services: [serviceUuid] }] })
    .then(device => {
      log('Connecting to GATT Server...');
      return device.gatt.connect();
    })
    .then(server => {
      log('Getting Service...');
      return server.getPrimaryService(serviceUuid);
    })
    .then(service => {
      log('Getting Characteristic...');
      return service.getCharacteristic(characteristicUuid);
    })
    .then(characteristic => {
      myCharacteristic = characteristic;
      return myCharacteristic.startNotifications().then(_ => {
        log('> Notifications started');
        myCharacteristic.addEventListener('characteristicvaluechanged',
          handleNotifications);
      });
    })
    .catch(error => {
      log('Argh! ' + error);
    });
}

function onStopButtonClick() {
  if (myCharacteristic) {
    myCharacteristic.stopNotifications()
      .then(_ => {
        log('> Notifications stopped');
        myCharacteristic.removeEventListener('characteristicvaluechanged',
          handleNotifications);
      })
      .catch(error => {
        log('Argh! ' + error);
      });
  }
}



function handleNotifications(event) {


  let value = event.target.value;
  let id = event.target.service.device.id;
  let int16View = new Int16Array(value.buffer);

  for (let i = 0; i < 7; i++) {
    iput = int16View[i];
    if (dataQueue.length == 50) {
      dataQueue.shift();
    }
    dataQueue.push(iput);

  }
  if (dataQueue.length == 50) {
    var body = {
      "value": dataQueue
    };
    loadDoc(body);
    log(body);
  }

}

var ajax = new XMLHttpRequest();
ajax.onreadystatechange = callback;

function loadDoc(body) {
  ajax.open('POST', 'http://127.0.0.1:5000/getEstimation', true);
 // ajax.overrideMimeType("application/json");
  ajax.setRequestHeader("Content-type", "application/json");
  ajax.send(JSON.stringify(body));
}

function callback() {
  if (ajax.readyState == 4) {
    log(ajax.responseText);
  }
}



