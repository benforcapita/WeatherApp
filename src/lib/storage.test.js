import { describe, expect, it, beforeEach } from 'vitest';
import { loadPreferences, savePreferences, readCache, writeCache, PREFERENCES_KEY, CACHE_KEY } from './storage';
import { fixture, berlin } from '../../tests/fixtures';
beforeEach(()=>localStorage.clear());
describe('durable, namespaced local data',()=>{
 it('never reads unrelated local storage',()=>{localStorage.setItem('some-other-app','private'); expect(loadPreferences().favorites).toEqual([]);savePreferences({unit:'fahrenheit',favorites:[berlin],selected:berlin});expect(localStorage.getItem('some-other-app')).toBe('private');expect(loadPreferences().unit).toBe('fahrenheit');});
 it('ignores corrupt storage, invalid cities, invalid units and duplicate favorites',()=>{localStorage.setItem(PREFERENCES_KEY,'{');expect(loadPreferences().unit).toBe('celsius');localStorage.setItem(PREFERENCES_KEY,JSON.stringify({version:1,unit:'kelvin',favorites:[berlin,berlin,{id:1,name:'oops',latitude:999}],selected:{}}));expect(loadPreferences().favorites).toEqual([berlin]);expect(loadPreferences().selected).toBeNull();});
 it('reports unavailable storage instead of falsely claiming persistence',()=>{const broken={getItem(){throw Error()},setItem(){throw Error()}};expect(loadPreferences(broken).storageAvailable).toBe(false);expect(savePreferences({unit:'celsius',favorites:[]},broken)).toBe(false);});
 it('round-trips only validated city-matching forecasts and expires after 24 hours',()=>{const f={...fixture(),receivedAt:Date.now()};expect(writeCache(berlin,f)).toBe(true);expect(readCache(berlin).current.temperature_2m).toBe(20);expect(readCache({...berlin,id:2})).toBeNull();expect(readCache(berlin,localStorage,Date.now()+25*3600000)).toBeNull();});
 it('rejects corrupt cache and bounds stored entries',()=>{localStorage.setItem(CACHE_KEY,'[]');expect(readCache(berlin)).toBeNull();for(let i=0;i<25;i++)writeCache({...berlin,id:i},{...fixture(),receivedAt:Date.now()+i});expect(Object.keys(JSON.parse(localStorage.getItem(CACHE_KEY)).entries).length).toBeLessThanOrEqual(12);});
});
