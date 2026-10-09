import { test, expect } from '@playwright/test';
test('opt-in actual Open-Meteo browser/CORS smoke with a public example city',async({page})=>{
 test.skip(process.env.WEATHER_LIVE_SMOKE!=='1','External-network smoke is opt-in, separate from deterministic CI.');
 const results=[];page.on('response',response=>{if(response.url().includes('open-meteo.com'))results.push({status:response.status(),endpoint:new URL(response.url()).hostname});});
 await page.goto('/');await page.getByRole('searchbox',{name:'Search for a city'}).fill('Berlin');await page.getByRole('button',{name:'Search',exact:true}).click();await page.getByRole('button',{name:/Berlin, Germany/}).first().click();await expect(page.getByText(/Updated from Open-Meteo/)).toBeVisible({timeout:20000});await expect(page.getByRole('heading',{name:'Next 7 days'})).toBeVisible();await expect(page.getByTestId('current-temperature')).not.toContainText('—');console.log('LIVE_PROVIDER_EVIDENCE',JSON.stringify(results));await page.screenshot({path:'test-results/actual-provider-browser.png',fullPage:true});
});
