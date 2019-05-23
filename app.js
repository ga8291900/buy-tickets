const puppeteer = require('puppeteer');
const conif = require('node-console-input');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: './userData',
    slowMo: 1000
  });
  const page = await browser.newPage();
  await page.goto('https://tixcraft.com/');
  let program = conif.getConsoleInput('program: ');
  await page.goto(`https://tixcraft.com/activity/game/${program}`);
  let quantity = conif.getConsoleInput('quantity(1~4): ');
  let position = conif.getConsoleInput('position: ') - 1;
  let start = conif.getConsoleInput('start??(Y/N)', false);
  if (start == 'y' || again == 'Y') {
    gogo();
  } else {
    await browser.close();
  }
  // 監聽錯誤事件
  async function error(dialog) {
    dialog.accept();
    console.log('驗證碼錯誤');
    await page.click('#TicketForm_agree');
    await page.select('.mobile-select', quantity);
    let code = conif.getConsoleInput('Code: ', false);
    await page.type('#TicketForm_verifyCode', code);
    await page.click('#ticketPriceSubmit');
  }

  async function gogo() {
    await page.waitForSelector('.btn-next', { timeout: 999999999 });
    await page.click('.btn-next');
    await page.waitForSelector('.select_form_b');
    let position_link = await page.$$('.select_form_b>a');
    await position_link[position].click();
    await page.waitForSelector('#TicketForm_agree');
    await page.click('#TicketForm_agree');
    await page.select('.mobile-select', quantity);
    await page.evaluate(() => {
      location.reload(true)
    })
    let code = conif.getConsoleInput('Code: ', false);
    await page.type('#TicketForm_verifyCode', code);
    await page.click('#ticketPriceSubmit');
    await page.on('dialog', error);
    await page.waitForSelector('#cancelTimeCountdown', { timeout: 999999999 });
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