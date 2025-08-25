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
        
        # Simple package that just runs the built dist/index.js
        package = pkgs.stdenv.mkDerivation {
          name = "mcp-macos-notify";
          version = "0.1.0";
          
          src = ./.;
          
          buildInputs = with pkgs; [ nodejs_20 nodePackages.npm ];
          
          buildPhase = ''
            export HOME=$TMPDIR
            npm ci --cache $TMPDIR/.npm
            npm run build
          '';
          
          installPhase = ''
            mkdir -p $out/bin $out/lib
            cp -r dist $out/lib/
            cp -r node_modules $out/lib/
            cp package.json $out/lib/
            
            # Create wrapper script
            cat > $out/bin/mcp-macos-notify << 'EOF'
            #!/bin/sh
            exec ${pkgs.nodejs_20}/bin/node $out/lib/dist/index.js "$@"
            EOF
            chmod +x $out/bin/mcp-macos-notify
          '';
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
              echo "  nix build    - Build Nix package"
              echo "  nix run      - Run the server"
            '';
          };
        };
      });
}