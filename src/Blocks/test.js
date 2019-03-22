import { blocks, editor, data } from '@frontkom/gutenberg-js';

const { dispatch, select } = data;
const { registerBlockType } = blocks;
const { RichText } = editor;

// Setting block's properties
const myFirstBlock = {
    title: 'My first block!',
    icon: 'universal-access-alt',
    category: 'cloudblocks',

    attributes: {
        content: {
            type: 'array',
            source: 'html',
            selector: 'p',
        },
    },

    edit( { attributes, className, setAttributes } ) {
        const { content } = attributes;

        function onChangeContent( newContent ) {
            setAttributes( { content: newContent } );
        }

        return (
            <RichText
                tagName="ul"
                multiline="li"
                className={ className }
                onChange={ onChangeContent }
                value={ content }
            />
        );
    },

    save( { attributes } ) {
        const { content } = attributes;

        return (
            <RichText.Content
                tagName="ul"
                multiline="li"
                value={ content }
            />
        );
    },
};

// Setting category's properties
const category = {
    slug: 'cloudblocks',
    title: 'Gutenberg-Cloud Blocks',
};

// Checking the category
const currentCategories = select('core/blocks').getCategories().filter(item => item.slug !== category.slug);
dispatch('core/blocks').setCategories([ category, ...currentCategories ]);

// Registering the new block
registerBlockType(`${category.slug}/my-first-block`, myFirstBlock);

