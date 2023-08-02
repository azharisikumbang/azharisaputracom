const { execSync } = require("child_process");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function(eleventyConfig) {
  eleventyConfig.addLayoutAlias('post', 'layouts/post.njk');
  eleventyConfig.addLayoutAlias('base', 'layouts/base.njk');
  eleventyConfig.addPassthroughCopy('./src/img');
  eleventyConfig.setServerOptions({
    watch: ['./public/css/styles.css']
  });
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addFilter('tanggalIndo', (objDate) => {
    return new Intl.DateTimeFormat(['ban', 'id'], {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: 'Asia/Jakarta'
    }).format(objDate);
  });

  return {
    htmlTemplateEngine: "njk",
    dir: {
      input: 'src',
      output: 'public'
    }
  }
}