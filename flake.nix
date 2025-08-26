{
  description = "MCP server for macOS system integration via AppleScript";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        nodejs = pkgs.nodejs_24;
        
        # Create a simple package that runs TypeScript directly
        mcp-macos = pkgs.buildNpmPackage {
          pname = "mcp-macos";
          version = "0.1.0";
          src = ./.;
          
          nodejs = pkgs.nodejs_24;
          
          npmDepsHash = "sha256-iFkLpxAgiytV+nSz1RkKrF7VkKKEd/UCGpyPjbTe+LM=";
          
          # No build phase needed - we run TypeScript directly
          dontNpmBuild = true;
          
          installPhase = ''
            runHook preInstall
            
            mkdir -p $out/lib/mcp-macos
            cp -r . $out/lib/mcp-macos/
            
            # Create executable that runs TypeScript directly with Node 24
            mkdir -p $out/bin
            cat > $out/bin/mcp-macos << EOF
            #!/bin/sh
            cd $out/lib/mcp-macos
            exec ${nodejs}/bin/node --experimental-strip-types src/index.ts "\$@"
            EOF
            chmod +x $out/bin/mcp-macos
            
            runHook postInstall
          '';
        };
      in
      {
        packages = {
          default = mcp-macos;
        };

        apps = {
          default = {
            type = "app";
            program = "${mcp-macos}/bin/mcp-macos";
          };
        };

        devShells = {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              nodejs_24
              nodePackages.npm
              nodePackages.typescript-language-server
              nodePackages.typescript
              jq
            ];
            
            shellHook = ''
              echo "🚀 MCP macOS development environment"
              echo "Node.js version: $(node --version)"
              echo "TypeScript native support: enabled"
              echo ""
              echo "Available commands:"
              echo "  npm install                    - Install dependencies"
              echo "  npm run dev                    - Run in development mode" 
              echo "  npm test                       - Run tests"
              echo "  npm run typecheck              - Type check without compilation"
              echo "  node --experimental-strip-types src/index.ts  - Run directly"
              echo "  nix build                      - Build portable binary"
              echo "  nix run                        - Run the server"
              echo ""
              echo "Usage for Claude Desktop:"
              echo '  "command": "nix", "args": ["run", "${toString ./.}"]'
            '';
          };
        };
      });
}
