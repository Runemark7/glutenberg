//Importera "blocks" så att vi kan avregga dem härifrån
import { blocks } from '@frontkom/gutenberg-js';
//Importera all customblocks på detta viset:
export * from './test';
export * from './test2';


// Här avregisteras default-blocks, funktionen körs precis efter att sidan laddats in (editor.js rad: 61)
export function unRegister () {
    blocks.unregisterBlockType('core/paragraph');
    //blocks.unregisterBlockType('core/image');
}
