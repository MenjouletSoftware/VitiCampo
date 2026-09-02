export async function analyzeImageWithTF(imageBlob: Blob) {
  function loadScript(src: string) {
    return new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
  }

  try {
    // Cargar desde CDN en tiempo de ejecución para evitar bundling en build
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.12.0/dist/tf.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.0/dist/mobilenet.min.js');

    const img = document.createElement('img');
    img.src = URL.createObjectURL(imageBlob);
    await new Promise((res) => (img.onload = res));

    // @ts-ignore
    const mobilenet = (window as any).mobilenet ?? (await (window as any).mobilenet?.load?.()) ?? null;

    if (!mobilenet) {
      // Si la librería expone la función global load
      // @ts-ignore
      const model = await (window as any).mobilenet.load({ version: 2, alpha: 1.0 });
      const predictions = await model.classify(img as any);
      const mapping = predictions.map((p: any) => p.className).join(', ');
      return { success: true, predictions: mapping };
    }

    // Fallback: intentar usar la API si está disponible
    // @ts-ignore
    const model = await (window as any).mobilenet.load({ version: 2, alpha: 1.0 });
    const predictions = await model.classify(img as any);
    const mapping = predictions.map((p: any) => p.className).join(', ');
    return { success: true, predictions: mapping };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
