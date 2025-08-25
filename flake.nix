{
  description = "MCP server for macOS notifications via AppleScript";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
    flake-utils.url = "github:numtide/flake-utils";
    dream2nix = {
      url = "github:nix-community/dream2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, flake-utils, dream2nix }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        dream2nixLib = dream2nix.lib.init {
          pkgs = pkgs;
          config.projectRoot = ./.;
        };
        
        # Build the Node.js project using dream2nix
        package = dream2nixLib.buildPackageFromPackageJson {
          source = ./.;
          packageJson = ./package.json;
          packageLockJson = ./package-lock.json;
          nodejs = pkgs.nodejs_20;
        };
      in
      {
        packages = {
          default = package;
          mcp-macos-notify = package;
        };

        apps = {
          default = {
            type = "app";
            program = "${package}/bin/mcp-macos-notify";
          };
        };

        devShells = {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              nodejs_20
              nodePackages.npm
              nodePackages.typescript-language-server
              nodePackages.typescript
              jq
              just
            ];
            
            shellHook = ''
              echo "🚀 MCP macOS Notify development environment"
              echo "Node.js version: $(node --version)"
              echo "NPM version: $(npm --version)"
              echo ""
              echo "Available commands:"
              echo "  npm install  - Install dependencies"
              echo "  npm run dev  - Run in development mode"
              echo "  npm test     - Run tests"
              echo "  npm run build - Build for production"
            '';
          };
        };
      });
}