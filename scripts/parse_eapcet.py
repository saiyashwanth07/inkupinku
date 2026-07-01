import pandas as pd
import json
import os
import math

def clean_val(val):
    if pd.isna(val) or val == '' or str(val).strip() == '':
        return None
    try:
        return int(val)
    except:
        return str(val).strip()

def parse_excel():
    file_path = 'AP EAPCET.xlsx'
    
    # Read all sheets from excel file, ignoring headers so we can parse everything
    df_dict = pd.read_excel(file_path, sheet_name=None, header=None)
    
    # Combine all sheets into one big dataframe
    all_dfs = list(df_dict.values())
    df = pd.concat(all_dfs, ignore_index=True)
    
    col_mapping = {
        0: 'INSTCODE',
        1: 'NAME_OF_THE_INSTITUTION',
        2: 'TYPE',
        3: 'INST_REG',
        4: 'DIST',
        5: 'PLACE',
        6: 'COED',
        7: 'AFFL',
        8: 'ESTD',
        9: 'REGION',
        10: 'branch_code',
        11: 'OC_BOYS',
        12: 'OC_GIRLS',
        13: 'SC_BOYS',
        14: 'SC_GIRLS',
        15: 'ST_BOYS',
        16: 'ST_GIRLS',
        17: 'BCA_BOYS',
        18: 'BCA_GIRLS',
        19: 'BCB_BOYS',
        20: 'BCB_GIRLS',
        21: 'BCC_BOYS',
        22: 'BCC_GIRLS',
        23: 'BCD_BOYS',
        24: 'BCD_GIRLS',
        25: 'BCE_BOYS',
        26: 'BCE_GIRLS',
        27: 'OC_EWS_BOYS',
        28: 'OC_EWS_GIRLS',
        29: 'COLL_FEE'
    }
    
    df = df.rename(columns=col_mapping)
        
    colleges_dict = {}
    
    categories = [
        "OC_BOYS", "OC_GIRLS", "SC_BOYS", "SC_GIRLS", "ST_BOYS", "ST_GIRLS",
        "BCA_BOYS", "BCA_GIRLS", "BCB_BOYS", "BCB_GIRLS", "BCC_BOYS", "BCC_GIRLS",
        "BCD_BOYS", "BCD_GIRLS", "BCE_BOYS", "BCE_GIRLS", "OC_EWS_BOYS", "OC_EWS_GIRLS"
    ]
    
    for _, row in df.iterrows():
        inst_code = str(row['INSTCODE']).strip()
        if not inst_code or pd.isna(row['INSTCODE']) or inst_code == 'nan' or inst_code == 'INSTCODE' or inst_code == 'None':
            continue
            
        if inst_code not in colleges_dict:
            colleges_dict[inst_code] = {
                "id": inst_code.lower(),
                "name": str(row['NAME_OF_THE_INSTITUTION']).strip(),
                "code": inst_code,
                "district": str(row['DIST']).strip(),
                "place": str(row['PLACE']).strip(),
                "type": "Private" if str(row['TYPE']).strip() in ["PVT", "Pvt"] else str(row['TYPE']).strip(),
                "coed": str(row['COED']).strip(),
                "established": clean_val(row['ESTD']),
                "localArea": str(row['REGION']).strip(),
                "website": "",
                "campusSize": "Unknown",
                "placements": "Data unavailable",
                "rating": 4.0,
                "isPartner": False,
                "branches": []
            }
        
        branch_code = str(row['branch_code']).strip()
        fee = clean_val(row['COLL_FEE'])
        
        # Build category cutoffs
        cutoffs = {}
        for cat in categories:
            val = clean_val(row[cat])
            if isinstance(val, int):
                # Standardize category names for frontend
                cat_parts = cat.split('_')
                gender = "Boys" if cat_parts[-1] == "BOYS" else "Girls"
                cat_name = "_".join(cat_parts[:-1])
                
                # Normalizing EWS and BC types
                if cat_name == "OC_EWS":
                    cat_name = "OC-EWS"
                elif cat_name.startswith("BC"):
                    cat_name = f"BC-{cat_name[-1]}"
                elif cat_name == "OC" or cat_name == "SC" or cat_name == "ST":
                    pass
                
                final_cat_key = f"{cat_name}-{gender}"
                cutoffs[final_cat_key] = val
        
        if len(cutoffs) > 0:
            branch_info = {
                "branch": branch_code,
                "fee": fee,
                "cutoffs": cutoffs
            }
            colleges_dict[inst_code]['branches'].append(branch_info)
            
            # Aggregate the fee if missing at college level
            if 'tuitionFee' not in colleges_dict[inst_code] or not colleges_dict[inst_code]['tuitionFee']:
                colleges_dict[inst_code]['tuitionFee'] = fee
    
    # Convert dict to array
    colleges_list = list(colleges_dict.values())
    
    # Write to JSON
    output_path = 'src/data/colleges.json'
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(colleges_list, f, indent=2)
        
    print(f"Successfully processed {len(colleges_list)} unique colleges.")

if __name__ == "__main__":
    parse_excel()
