'use strict';

var sys = require('sys'),
    Fs  = require('fs');

var Handlebars = require('handlebars');

var PromiseTimer = require('promise_timer');

Handlebars.registerHelper('if_eq', function (a, b, opts) {
  if (a == b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

Handlebars.registerHelper('is_req', function (a, b, opts) {
  if (!a) {
    return opts.inverse(this);
  }
  if (b == 'hid') {
    console.log(" aaaaa");
    console.log(a);
    console.log(" bbbb " + b);
  }
//  parameters.requiredProps
  if (a.requiredProps && (b in a.requiredProps)) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

function main(args) {
  /*
   const CliArgs = require('commander')
   .option('-o, --output_dir <path>', 'Write markdown here.')
   .parse(args);
   */

  const CliArgs = {
    output_dir : "html"
  };

  const timer = new PromiseTimer();

  var Docs           = require('json-schema-docs-generator');
  var schemaDriver   = new Docs.SchemaDriver(['api/**/*.json']);
  var templateDriver = new Docs.TemplateDriver(['templates/*.handlebars']);

  var composer = new Docs.Composer(schemaDriver, templateDriver, {
    destination : CliArgs.output_dir,
    pages       : [{
      file     : 'index.html',
      title    : 'Ardefact Frontend API Docs',
      sections : [{
        title   : "Data Models",
        schemas : [
          '/models/User',
          '/models/Item',
          '/models/Cluster',
          '/models/Location'
        ]
      },
        {
          title   : "REST",
          schemas : [
            '/rest/login',
          ]
        },
        {
          title   : "REST/User",
          schemas : [
            '/rest/users/get'
          ]
        },
        {
          title   : "REST/Item",
          schemas : [
            '/rest/items/get'
          ]
        },
        {
          title   : "REST/Profile",
          schemas : [
            '/rest/profile/update_password'
          ]
        },
        {
          title   : "REST/Search",
          schemas : [
            '/rest/search/search',
            '/rest/search/address'
          ]
        }
      ]
    }]
  });

  composer.addTransform(Docs.SchemaTransformer);

  composer.build()
    .bind(composer)
    .then(composer.write)
    .then(timer.timeIt("generating html"))
    .catch(error => console.log(error));


}


if (!module.parent) {
  main(sys.argv);
}


