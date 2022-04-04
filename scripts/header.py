import glob

header = """/*\n\tauthor....: nekumelon\n\tLicense...: MIT (Check LICENSE)\n*/""";

for filePath in glob.iglob('./**/*.js', recursive=True):
    with open(filePath, 'r') as file:
        contents = file.read();

    if (header in contents): continue;
    
    with open(filePath, 'w') as file:
        file.write(header + '\n\n' + contents);
