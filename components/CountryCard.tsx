import type { ReactElement } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/Colors';
import { RESTCOUNTRIES_BASE_URL } from '@/constants/api';
import { useFetch } from '@/hooks/useFetch';
import type { Country } from '@/types/country';

interface CountryCardProps {
  countryName: string;
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
  const { data, loading, error } = useFetch<Country[]>(url);
  const country = data?.[0];

  if (loading) {
    return <View style={styles.skeleton} />;
  }

  if (error || !country) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Image source={{ uri: country.flags.png }} style={styles.flag} />
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
