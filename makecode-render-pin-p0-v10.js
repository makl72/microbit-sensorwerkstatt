(() => {
  const makecodeOrigin = 'https://makecode.microbit.org';
  const snippets = [
`input.onButtonPressed(Button.A, function () {
    basic.showNumber(pins.analogReadPin(P0))
})`,
`let grenze = 500
basic.forever(function () {
    let licht = pins.analogReadPin(P0)
    if (licht < grenze) {
        basic.showLeds(\`
            . . # . .
            # . # . #
            . # # # .
            # # # # #
            . # . # .
        \`)
    } else {
        basic.clearScreen()
    }
    basic.pause(100)
})`,
`let alarm = 0
let grenze = 500
input.onButtonPressed(Button.A, function () {
    alarm = 0
})
basic.forever(function () {
    if (pins.analogReadPin(P0) > grenze) {
        alarm = 1
    }
    if (alarm == 1) {
        basic.showIcon(IconNames.No)
    } else {
        basic.clearScreen()
    }
    basic.pause(100)
})`,
`input.onButtonPressed(Button.A, function () {
    basic.showNumber(pins.analogReadPin(P0))
})`,
`basic.forever(function () {
    led.plotBarGraph(pins.analogReadPin(P0), 1023)
    basic.pause(100)
})`,
`input.onButtonPressed(Button.A, function () {
    let code = pins.analogReadPin(P0)
    if (code >= 450 && code <= 550) {
        basic.showIcon(IconNames.Yes)
    } else {
        basic.showIcon(IconNames.No)
    }
})`,
`input.onButtonPressed(Button.A, function () {
    basic.showNumber(pins.analogReadPin(P0))
})`,
`let grenze = 500
basic.forever(function () {
    let waerme = pins.analogReadPin(P0)
    if (waerme > grenze) {
        basic.showIcon(IconNames.No)
    } else {
        basic.showIcon(IconNames.Yes)
    }
    basic.pause(100)
})`,
`let kalt = 430
let warm = 570
basic.forever(function () {
    let waerme = pins.analogReadPin(P0)
    if (waerme < kalt) {
        basic.showLeds(\`
            . . . . .
            . # # # .
            . # . # .
            . # # # .
            . . . . .
        \`)
    } else if (waerme > warm) {
        basic.showIcon(IconNames.No)
    } else {
        basic.showIcon(IconNames.Happy)
    }
    basic.pause(100)
})`,
`input.onButtonPressed(Button.A, function () {
    basic.showNumber(pins.analogReadPin(P0))
})`,
`let grenze = 500
basic.forever(function () {
    let waerme = pins.analogReadPin(P0)
    if (waerme < grenze) {
        basic.showIcon(IconNames.No)
    } else {
        basic.showIcon(IconNames.Yes)
    }
    basic.pause(100)
})`,
`let basis = pins.analogReadPin(P0)
let rekord = 0
input.onButtonPressed(Button.A, function () {
    basis = pins.analogReadPin(P0)
    rekord = 0
})
input.onButtonPressed(Button.B, function () {
    basic.showNumber(rekord)
})
basic.forever(function () {
    let differenz = Math.abs(pins.analogReadPin(P0) - basis)
    if (differenz > rekord) {
        rekord = differenz
    }
    basic.pause(100)
})`,
`input.onButtonPressed(Button.A, function () {
    basic.showNumber(pins.digitalReadPin(P0))
})`,
`let erkannt = 0
basic.forever(function () {
    if (pins.digitalReadPin(P0) == erkannt) {
        basic.showIcon(IconNames.Yes)
    } else {
        basic.clearScreen()
    }
    basic.pause(50)
})`,
`let vorher = 1
let anzahl = 0
input.onButtonPressed(Button.B, function () {
    basic.showNumber(anzahl)
})
basic.forever(function () {
    let jetzt = pins.digitalReadPin(P0)
    if (jetzt == 0 && vorher == 1) {
        anzahl += 1
    }
    vorher = jetzt
    basic.pause(20)
})`,
`input.onButtonPressed(Button.A, function () {
    let cm = sonar.ping(P1, P2, cm)
    if (cm == 0) {
        basic.showString("?")
    } else {
        basic.showNumber(cm)
    }
})`,
`basic.forever(function () {
    let cm = sonar.ping(P1, P2, cm)
    if (cm == 0) {
        basic.showString("?")
    } else if (cm <= 12) {
        basic.showIcon(IconNames.No)
    } else {
        basic.showIcon(IconNames.Yes)
    }
    basic.pause(100)
})`,
`basic.forever(function () {
    let cm = sonar.ping(P1, P2, cm)
    if (cm == 0) {
        basic.showString("?")
    } else if (cm < 17) {
        basic.showArrow(ArrowNames.North)
    } else if (cm > 23) {
        basic.showArrow(ArrowNames.South)
    } else {
        basic.showIcon(IconNames.Happy)
    }
    basic.pause(100)
})`
  ];

  const graphics = [...document.querySelectorAll('.makecode-graphic')];
  if (!graphics.length) return;

  function makeCompilerCode(code) {
    const analogP0 = ['Analog', 'Pin.P0'].join('');
    const digitalP0 = ['Digital', 'Pin.P0'].join('');
    const digitalP1 = ['Digital', 'Pin.P1'].join('');
    const digitalP2 = ['Digital', 'Pin.P2'].join('');
    const centimetres = ['PingUnit', 'Centimeters'].join('.');
    return code
      .replaceAll('pins.analogReadPin(P0)', `pins.analogReadPin(${analogP0})`)
      .replaceAll('pins.digitalReadPin(P0)', `pins.digitalReadPin(${digitalP0})`)
      .replaceAll('sonar.ping(P1, P2, cm)', `sonar.ping(${digitalP1}, ${digitalP2}, ${centimetres})`);
  }

  function makeReadable(code) {
    return code
      .replaceAll('pins.analogReadPin(P0)', '«analoge Werte von Pin P0»')
      .replaceAll('pins.digitalReadPin(P0)', '«digitale Werte von Pin P0»')
      .replaceAll('sonar.ping(P1, P2, cm)', '«ping · Trigger P1 · Echo P2 · cm»');
  }

  graphics.forEach((graphic, index) => {
    graphic.innerHTML = '';
    graphic.dataset.makecodeIndex = String(index);
    const status = document.createElement('div');
    status.className = 'makecode-status';
    status.textContent = 'Originale MakeCode-Blöcke werden geladen …';
    const fallback = document.createElement('pre');
    fallback.id = `makecode-snippet-${index}`;
    fallback.className = 'makecode-source';
    fallback.textContent = makeReadable(snippets[index] || '');
    fallback.setAttribute('aria-label', 'MakeCode-Blockfolge in Textform mit der Bezeichnung Pin P0');
    graphic.append(status, fallback);
  });

  const iframe = document.createElement('iframe');
  iframe.id = 'makecoderenderer';
  iframe.title = 'MakeCode-Blockrenderer';
  iframe.src = `${makecodeOrigin}/--docs?render=1&lang=de`;
  iframe.style.cssText = 'position:absolute;left:0;bottom:0;width:1px;height:1px;border:0;opacity:0;pointer-events:none';
  document.body.appendChild(iframe);

  function send(index) {
    const usesSonar = index >= 15;
    const request = {
      type: 'renderblocks',
      id: `makecode-snippet-${index}`,
      code: makeCompilerCode(snippets[index])
    };
    if (usesSonar) {
      request.options = { package: 'sonar=github:microsoft/pxt-sonar#v0.0.6' };
    }
    iframe.contentWindow.postMessage(request, `${makecodeOrigin}/`);
  }

  window.addEventListener('message', event => {
    if (event.origin !== makecodeOrigin) return;
    const message = event.data || {};
    if (message.source !== 'makecode') return;
    if (message.type === 'renderready') {
      snippets.forEach((_, index) => send(index));
      return;
    }
    if (message.type !== 'renderblocks') return;
    const source = document.getElementById(message.id);
    const graphic = source?.closest('.makecode-graphic');
    if (!source || !graphic) return;
    const status = graphic.querySelector('.makecode-status');
    if (message.error || (!message.uri && !message.svg)) {
      if (status) status.textContent = 'Die Blockgrafik konnte nicht geladen werden. Ersatzansicht mit MakeCode-Bezeichnungen:';
      source.hidden = false;
      return;
    }
    const image = document.createElement('img');
    image.className = 'makecode-block-image';
    const cleanedSvg = message.svg
      ? message.svg
          .replaceAll('Analog-Pin', '')
          .replaceAll('Digital-Pin', '')
          .replaceAll('Analog pin', '')
          .replaceAll('Digital pin', '')
      : '';
    image.src = cleanedSvg
      ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanedSvg)}`
      : message.uri;
    image.width = message.width || 800;
    image.height = message.height || 400;
    image.alt = 'Originale deutsche MakeCode-Blockfolge';
    source.replaceWith(image);
    if (status) status.remove();
    graphic.dataset.rendered = 'true';
  });

  window.setTimeout(() => {
    document.querySelectorAll('.makecode-graphic:not([data-rendered="true"]) .makecode-status').forEach(status => {
      status.textContent = 'MakeCode ist gerade nicht erreichbar. Ersatzansicht mit „Pin P0“:';
      const source = status.parentElement.querySelector('.makecode-source');
      if (source) source.hidden = false;
    });
  }, 15000);
})();
