const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        "string.escapeHTML": "{{#label}} must not include HTML!"
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
});

// If we try to inject h1 element in the title of campground while editing it like <h1>Hi</h1>, it'll
// just be printed as text and not be injected in the template by treating it  as HTML  as h1 element
// because whenever we use ejs tag like<%= %> it is going to escape html. So it does not treat the text
// that we entered while editing the page <h1>Hi</h1> as an html element. If we goto the view page source
// the h1 element will be turned into entity codes. But there is one place where elements are being
// treated as html. When we click on the pin on the map, the title pops up along with 'Hi' which was
// written inside h1 element. To pass campground to showPageMap.js file, we had to do this const
// campground = <%- JSON.stringify(campground) %> which does not have an equal sign to escape html. So,
// if we include a <script>alert('hey')</script>, it'll be displayed after submitting the form after
// editing the title.

// Joi doesn't come with validation for escaping html. A tool called express-validator offers sanitization
// or html escaping. We are not going to use it but write our own version on top of joi. Joi allows us
// to create extensions and these allow us to define htmlSafe() i.e. body: Joi.string.required().htmlSafe().
// htmlSafe() doesn't exist but we can define our own methods like this. We defined an extension on joi.string()
// called escapeHTML which has a function called validate which joi will call automatically with whatever
// value it receives. We are also using a package called sanitizeHtml which we have installed
// npm i sanitize-html and it sanitizes html inputs. If something with html tags is passed while editing
// the page, this package strips them away.