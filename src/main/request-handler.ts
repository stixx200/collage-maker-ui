import { ipcMain } from 'electron';
import { Maker } from './collage-maker';
import { getTemplate } from './template-resolver';

async function onCreateCollage(event, arg) {
  console.log(`Create collage with data: ${JSON.stringify(arg)}`);
  const maker = new Maker();
  const template = getTemplate(arg.template);
  const collage = await maker.createCollage(template, arg.photos);
  event.reply('collage', collage);
}

export function init() {
  ipcMain.on('create-collage', onCreateCollage);
}

export function deinit() {
  ipcMain.removeListener('create-collage', onCreateCollage);
}
