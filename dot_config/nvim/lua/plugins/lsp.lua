local util = require("lspconfig.util")

return {
  -- {
  --   "neovim/nvim-lspconfig",
  --   opts = {
  --     servers = {
  --       volar = {
  --         filetypes = {
  --           "typescript",
  --           "vue",
  --         },
  --         root_dir = util.root_pattern("src/App.vue"),
  --       },
  --     },
  --   },
  -- },
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        qmlls = {
          cmd = { "qmlls6" },
          filetypes = { "qml" },
          root_dir = function(fname)
            return require("lspconfig.util").root_pattern(".git")(fname) or vim.fn.getcwd()
          end,
        },
      },
      setup = {
        volar = function(_, opts)
          opts.on_attach = function(client, _)
            client.server_capabilities.documentFormattingProvider = false
            client.server_capabilities.documentRangeFormattingProvider = false
          end
        end,
      },
    },
  },
}
