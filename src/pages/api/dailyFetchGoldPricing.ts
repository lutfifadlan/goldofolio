import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { load } from 'cheerio';
import { supabase } from '@/utils/supabaseClient';
import { format, startOfToday } from 'date-fns';
import { id } from 'date-fns/locale';
import { GoldBuyingPrice } from "@/interfaces"

type TableRow = string[];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Define the date range for today
  const today = startOfToday();
  await fetchData(today);

  res.status(200).json({ message: 'Fetch and insert operation completed.' });
}

async function fetchData(currentDate: Date) {
  const formattedDate = format(currentDate, "yyyy/MMMM/dd", { locale: id });
  const url = `https://harga-emas.org/history-harga/${formattedDate}`;
  console.log(`Fetching data for ${url}`);

  try {
    const response = await axios.get(url);
    const $ = load(response.data);
    const data = $("#container > div:nth-child(3) > div.col-md-8 > table:nth-child(2) > tbody");
    const allRows: TableRow[] = [];
    const rows = data.children('tr').slice(2);

    for (let i = 0; i < rows.length; i++) {
      const tdElements = $(rows[i]).find('td');
      const row = tdElements.map((index, el) => $(el).text().trim()).get();

      if (i === 12) {
        // Insert data to database
        const formattedAllrows: GoldBuyingPrice[] = allRows.map(row => ({
          Gram: row[0],
          "Antam per Batangan (Rp)": row[1],
          "Antam per Gram (Rp)": row[2]
        }));
        const goldSellingPrice = extractGoldSellingPrice(row[0]);
        console.log('formattedAllrows =', formattedAllrows);
        await insertData(format(currentDate, 'yyyy-MM-dd'), formattedAllrows, goldSellingPrice);
      } else {
        console.log('row =', row);
        allRows.push(row);
      }
    }
  } catch (error) {
    console.error(`Failed to fetch data for ${formattedDate}:`, error);
  }
}

async function insertData(date: string, goldBuyingPrice: any[], goldSellingPrice: string) {
  const data = { price_date: date, gold_buying_price: goldBuyingPrice, gold_selling_price: goldSellingPrice };
  console.log('data to be inserted =', data);
  const { error } = await supabase.from('gold_price').insert([data]);

  if (!error) {
    console.log(`Data for ${date} inserted successfully.`);
  } else {
    console.log(`Failed to insert data for ${date}. Response:`, error);
  }
}

function extractGoldSellingPrice(text: string): string {
  const priceMatch = /Rp\.?\s*([\d\.,]+\/gram)/.exec(text);
  return priceMatch ? priceMatch[1] : "Price not found";
}
