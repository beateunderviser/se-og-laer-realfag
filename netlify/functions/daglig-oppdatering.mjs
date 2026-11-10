// Bygger siden på nytt hver natt, slik at endringer i regnearket kommer med.
// Krever miljøvariabelen BUILD_HOOK_URL i Netlify (se README).
export default async () => {
  const url = process.env.BUILD_HOOK_URL;
  if (!url) {
    console.log("BUILD_HOOK_URL er ikke satt. Hopper over.");
    return new Response("Mangler BUILD_HOOK_URL", { status: 200 });
  }
  const res = await fetch(url, { method: "POST" });
  console.log(`Startet ny bygging: ${res.status}`);
  return new Response("OK");
};

export const config = { schedule: "0 3 * * *" };
