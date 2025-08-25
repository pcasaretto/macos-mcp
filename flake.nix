{
  description = "MCP server for macOS notifications via AppleScript";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        nodejs = pkgs.nodejs_20;
      in
      {
        packages = {
          default = pkgs.stdenv.mkDerivation {
            name = "mcp-macos-notify";
            version = "0.1.0";
            
            src = ./.;
            
            nativeBuildInputs = with pkgs; [ nodejs nodePackages.npm ];
            
            buildPhase = ''
              export HOME=$TMPDIR
              export npm_config_cache=$TMPDIR/.npm
              npm ci
              npm run build
            '';
            
            installPhase = ''
              mkdir -p $out/bin
              cp -r dist $out/
              cp -r node_modules $out/
              cp package.json $out/
              
              # Create executable wrapper
              cat > $out/bin/mcp-macos-notify << 'EOF'
            #!/bin/sh
            exec ${nodejs}/bin/node $out/dist/index.js "$@"
            EOF
              chmod +x $out/bin/mcp-macos-notify
            '';
          };
        };

        apps = {
          default = {
            type = "app";
            program = "${self.packages.${system}.default}/bin/mcp-macos-notify";
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
            ];
            
            shellHook = ''
              echo "🚀 MCP macOS Notify development environment"
              echo "Node.js version: $(node --version)"
              echo "NPM version: $(npm --version)"
              echo ""
              echo "Available commands:"
              echo "  npm install       - Install dependencies"
              echo "  npm run dev       - Run in development mode" 
              echo "  npm test          - Run tests"
              echo "  npm run build     - Build for production"
              echo "  nix build         - Build Nix package"
              echo "  nix run           - Run the server"
              echo ""
              echo "Usage:"
              echo "  # For Claude Desktop, use: nix run /path/to/this/project"
              echo "  # Or use the built binary: ./result/bin/mcp-macos-notify"
            '';
          };
        };
      });
}