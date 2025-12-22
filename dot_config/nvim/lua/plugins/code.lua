return {
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        tofu_ls = {
          filetypes = { "terraform", "hcl", "terraform-vars" },
        },
      },
    },
  },
  {
    "stevearc/conform.nvim",
    event = { "BufWritePre" },
    cmd = { "ConformInfo" },
    keys = {
      {
        -- Customize or remove this keymap to your liking
        "<leader>F",
        function()
          require("conform").format({ async = true })
        end,
        mode = "",
        desc = "Format buffer",
      },
    },
    -- This will provide type hinting with LuaLS
    ---@module "conform"
    ---@type conform.setupOpts
    opts = {
      -- Customize formatters
      formatters = {
        shfmt = {
          prepend_args = { "-i", "2" },
        },
        sqruff = {
          command = "sqruff",
          args = {
            "fix",
            "-",
          },
          stdin = true,
        },
        tfmt = {
          command = "tofu",
          args = { "fmt", "-" },
          stdin = true,
        },
      },
      -- Define your formatters
      formatters_by_ft = {
        lua = { "stylua" },
        python = { "isort", "black" },
        javascript = { "prettierd", "prettier", stop_after_first = true },
        html = { "prettierd", "prettier", stop_after_first = true },
        vue = { "prettier" },
        qml = { "qmlformat" },
        sql = { "sqruff" },
        tf = { "tfmt" },
        terraform = { "tfmt" },
        hcl = { "tfmt" },
        ["terraform-vars"] = { "tfmt" },
      },
      -- Set default options
      default_format_opts = {
        lsp_format = "fallback",
      },
    },
    init = function()
      -- If you want the formatexpr, here is the place to set it
      vim.o.formatexpr = "v:lua.require'conform'.formatexpr()"
    end,
  },
  {
    "mfussenegger/nvim-lint",
    opts = {
      linters_by_ft = {
        sql = { "sqruff" },
      },
    },
  },
}
