/* Tim Swierad
 * 01/12/18
 * Wrapper services to set data to persist across page refreshes.
 *  this will always set the same settings for each key value pair set to persist
 * https://www.npmjs.com/package/angular-persistence#1
 */
import { Injectable } from '@angular/core';
import { PersistenceService, StorageType } from 'angular-persistence';

@Injectable()
export class PersistService {

    constructor(private persistenceService: PersistenceService) {}

    // configuration variables
    private storageType = StorageType.SESSION;
    private config = {type: this.storageType};


     /*
      * Set function to set data to be persistent across page refreshes.
      */
    public set(key, value) {
        this.persistenceService.set(key, value, {type: StorageType.SESSION});
    }

    /*
     * get function to get data that is persistent across page refreshes.
     */
    public get(key) {
        return this.persistenceService.get(key, this.storageType);
    }

    /*
     * function to see if key exists
     */
    public containsKey(key) {
        if (this.persistenceService.get(key, this.storageType)) {
          return true;
        } else {
          return false;
        }
    }


    // returns value for the specified key and removes it
    public remove(key) {
        return this.persistenceService.remove(key);
    }

    // clears all storage saved by this service, and returns a list
    // of keys that were removed
    public removeAll() {
        this.persistenceService.removeAll();
    }

    /*
     * cleans the storage of expired objects
     */
    public clean() {
        this.persistenceService.clean();
    }



}
