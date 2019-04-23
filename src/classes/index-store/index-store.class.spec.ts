import {IndexStore} from './index-store.class';

describe('Index store', () => {
    fit('test', () => {

        const store = {
            keyA: {
                id: 1,
                group: {
                    name: 'arrayEntryA'
                }
            },
            keyB: {
                id: 2
            }
        };
        const index = new IndexStore(store);

        // tslint:disable-next-line
        console.log(index);
        expect(index).toBeTruthy();
        // index._register(store);
        //
        // .index('id')
        // .index('group', 'name');

        // const index = {
        //     'id': {
        //         1: ['keyA'],
        //         2: ['keyB']
        //     },
        //     'group.name': {
        //         'arrayEntryA': ['keyB']
        //     }
        // };
    });
});
