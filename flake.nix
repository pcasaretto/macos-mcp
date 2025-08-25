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
        
        # Import node2nix generated packages
        nodePackages = import ./default.nix {
          inherit pkgs system nodejs;
        };
      in
      {
        packages = {
          default = nodePackages.package.override {
            src = ./.;
            
            buildInputs = [ nodejs ];
            
            postInstall = ''
              # Build TypeScript
              export HOME=$TMPDIR
              npm run build
              
              # Create executable that bundles Node.js
              mkdir -p $out/bin
              cat > $out/bin/mcp-macos-notify << 'EOF'
            #!/bin/sh
            exec ${nodejs}/bin/node $out/lib/node_modules/mcp-macos-notify/dist/index.js "$@"
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
              nodePackages.node2nix
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
              echo "  npm install         - Install dependencies"
              echo "  npm run dev         - Run in development mode" 
              echo "  npm test            - Run tests"
              echo "  npm run build       - Build for production"
              echo "  node2nix -l         - Regenerate node2nix files"
              echo "  nix build           - Build portable binary"
              echo "  nix run             - Run the server"
              echo ""
              echo "Usage for Claude Desktop:"
              echo '  "command": "nix", "args": ["run", "${toString ./.}"]'
            '';
          };
        };
      });
}