
async function main() {
  const result = await Bun.build({
    entrypoints: ["./scripts/start-server.ts"],
    outdir: "./server-build",
  });

  console.log(result);
}

main();
