import argparse
from datetime import datetime
from pipeline import ImportPipeline

def main():
    parser = argparse.ArgumentParser(description="Import automatisé et calcul des points de la FFC.")
    parser.add_argument(
        "--source",
        choices=["auto", "pdf"],
        default="auto",
        help="Source d'importation : 'auto' (tous les PDFs) ou 'pdf' (fichier spécifique via URL)."
    )
    parser.add_argument("--url", default="", help="L'URL directe vers le PDF.")
    parser.add_argument("--race-name", default="Course FFC", help="Renseigner manuellement le nom de la course.")
    parser.add_argument("--race-date", default=datetime.now().strftime("%Y-%m-%d"), help="Format: YYYY-MM-DD")
    
    args = parser.parse_args()
    pipeline = ImportPipeline()

    if args.source == "auto":
        pipeline.run_automated()
    elif args.source == "pdf":
        if not args.url:
            parser.error("--url parameter is missing for pdf source.")
        pipeline.run_single_pdf(args.url, args.race_name, args.race_date)

if __name__ == "__main__":
    main()
