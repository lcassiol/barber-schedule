"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="shell hero"><div><span className="eyebrow">Algo saiu do lugar</span><h1 className="display">Não foi possível carregar.</h1><button className="button" onClick={reset}>Tentar novamente</button></div></main>; }
