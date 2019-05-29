const puppeteer = require('puppeteer');
const conif = require('node-console-input');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: './userData'
  });
  const page = await browser.newPage();
  await page.goto('https://tixcraft.com/');
  let program = conif.getConsoleInput('program: ');
  await page.goto(`https://tixcraft.com/activity/game/${program}`);
  let quantity = conif.getConsoleInput('quantity(1~4): ');
  let position = conif.getConsoleInput('position: ') - 1;
  let start = conif.getConsoleInput('start??(Y/N)', false);
  if (start == 'y' || start == 'Y') {
    reflash();
  } else {
    await browser.close();
  }

  async function reflash() {
    let btn = await page.$('.btn-next');
    if (!btn) {
      await Promise.all([page.reload(), page.waitForNavigation()]);
      reflash();
    } else {
      gogo();
    }
  }

  async function error(dialog) {
    dialog.accept();
    console.log('驗證碼錯誤');
    await page.waitForSelector('#TicketForm_agree');
    await page.click('#TicketForm_agree');
    await page.waitForSelector('.mobile-select');
    await page.select('.mobile-select', quantity);
    let code = conif.getConsoleInput('Code: ', false);
    await page.type('#TicketForm_verifyCode', code);
    await page.click('#ticketPriceSubmit');
  }
  async function empty() {
    let position_link = await page.$$('.select_form_b>a');
    if (position_link[position]) {
      await position_link[position].click();
    } else {
      console.log('座位已售完');
      position = conif.getConsoleInput('newposition: ') - 1;
      await Promise.all([page.reload(), page.waitForNavigation()]);
      empty();
    }
  }
  async function emptyAlert() {
    dialog.accept();
    console.log('座位已售完');
    position = conif.getConsoleInput('newposition: ') - 1;
    let position_link = await page.$$('.select_form_b>a');
    await position_link[position].click();
  }
  async function gogo() {
    await page.click('.btn-next');
    await page.waitForSelector('.zone.area-list');
    empty();
    await page.on('dialog', emptyAlert);
    await page.waitForSelector('#TicketForm_agree');
    await page.removeListener('dialog', emptyAlert);
    await page.on('dialog', error);
    await page.click('#TicketForm_agree');
    await page.waitForSelector('.mobile-select');
    await page.select('.mobile-select', quantity);
    let code = conif.getConsoleInput('Code: ', false);
    await page.type('#TicketForm_verifyCode', code);
    await page.click('#ticketPriceSubmit');
    await page.waitForSelector('#cancelTimeCountdown', { timeout: 0 });
    await page.removeListener('dialog', error);
    let again = conif.getConsoleInput('again??(Y/N)', false);
    if (again == 'y' || again == 'Y') {
      await page.goto(`https://tixcraft.com/activity/game/${program}`);
      quantity = conif.getConsoleInput('quantity(1~4): ');
      position = conif.getConsoleInput('position: ');
      gogo();
    } else {
      await browser.close();
    }
  }
})();
