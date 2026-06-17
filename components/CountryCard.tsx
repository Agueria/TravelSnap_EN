import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/Colors';
import { RESTCOUNTRIES_BASE_URL } from '@/constants/api';
import type { Country } from '@/types/country';

const FLAG_BLURHASH = 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.';

interface CountryCardProps {
  countryName: string;
}

async function fetchCountries(url: string): Promise<Country[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as Country[];
}

function formatCurrency(country: Country): string {
  const currency = Object.values(country.currencies ?? {})[0];

  if (!currency) {
    return '-';
  }

  if (!currency.symbol) {
    return currency.name;
  }

  return `${currency.name} (${currency.symbol})`;
}

export function CountryCard({ countryName }: CountryCardProps): ReactElement | null {
  const url = `${RESTCOUNTRIES_BASE_URL}/name/${encodeURIComponent(countryName)}`;
  const {
    data,
    isLoading: loading,
    error,
  } = useQuery<Country[]>({
    queryKey: ['country', countryName],
    queryFn: () => fetchCountries(url),
    enabled: countryName.trim().length > 0,
    networkMode: 'online',
  });
  const country = data?.[0];

  if (loading) {
    return <View style={styles.skeleton} />;
  }

  if (error || !country) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: country.flags.png }}
        style={styles.flag}
        placeholder={{ blurhash: FLAG_BLURHASH }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
      />
      <View style={styles.content}>
        <Text style={styles.name}>{country.name.common}</Text>
        <Text style={styles.detail}>Capital: {country.capital?.[0] ?? '-'}</Text>
        <Text style={styles.detail}>Currency: {formatCurrency(country)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    height: 96,
    borderRadius: 12,
    backgroundColor: Colors.card,
    marginBottom: 20,
    opacity: 0.65,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 14,
  },
  flag: {
    width: 60,
    height: 40,
    borderRadius: 4,
    backgroundColor: Colors.inputBg,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  detail: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
