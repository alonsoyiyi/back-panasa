import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const nombre = searchParams.get('nombre');

  const filePath = path.join(process.cwd(), 'data', 'products.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const products = JSON.parse(fileContents);

  const filteredProducts = products.filter(product => product.nombre === nombre);

  return NextResponse.json(filteredProducts);
}

