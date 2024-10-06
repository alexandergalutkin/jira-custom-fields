import {Transformer} from './Transformer'

async function main(): Promise<void> {
    const configOptions: CustomTransformerConfigOptions = {
        historyType: '10001',
        customFields: {
            '10079': {
                name: 'Тестировщик',
                shortname: 'q',
            },
            '10080': {
                name: 'Ревьюер',
                shortname: 'r',
            }
        },
    }

    const transformer: Transformer = new Transformer(configOptions)
    await transformer.init()
}

((): void => {
    'use strict'

    main()
})()
