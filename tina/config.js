import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch,
  clientId: "cfae20d4-0c86-41b5-86dc-026216a94f1a", // Get this from tina.io
  token: "b9a498a00e9170de1f52b7321d4912c27ade4377", // Get this from tina.io

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "files/",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "post",
        label: "Posts",
        path: "src/posts",
        defaultItem: () => {
          return {
            // When a new post is created the title field will be set to "New post"
            tags: 'posts',
            layout: 'post',
            eleventyExcludeFromCollections: true
          }
        },
        fields: [
          {
            label: "Draft",
            name: "eleventyExcludeFromCollections",
            type: "boolean",
          }, {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },{
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },{
            type: 'string',
            label: 'Deskripsi',
            name: 'description',
            ui: {
              component: 'textarea',
            }
          },{
            label: 'Kategori',
            name: 'category',
            type: 'string',
            list: false,
            options: [
              {
                value: 'kode',
                label: 'Kode',
              },
              {
                value: "jaringan",
                label: "Jaringan",
              },
              {
                value: 'random',
                label: 'Random',
              }
            ]
          },{
            type: 'string',
            label: 'Permalink',
            name: 'permalink',
          },{
            type: 'datetime',
            label: 'Tanggal Publikasi',
            name: 'date',
          },{
            type: 'string',
            label: 'Layout',
            name: 'layout',
            list: false,
            options: [
              {
                value: 'post',
                label: 'post',
              },
              {
                value: 'note',
                label: 'note',
              },
              {
                value: 'page',
                label: 'page',
              }
            ]
          },{
            type: 'string',
            label: 'Tags',
            name: 'tags',
            list: false,
            options: [
              {
                value: 'posts',
                label: 'Postingan',
              },
              {
                value: 'notes',
                label: 'Notes',
              },
              {
                value: 'pages',
                label: 'Halaman',
              }
            ]
          }
        ],
      }
    ],
  },
});
