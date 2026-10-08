import sys
from PIL import Image
out=sys.argv[1]; fs=sys.argv[2:]
cols=4; w,h=480,270
rows=(len(fs)+cols-1)//cols
sheet=Image.new('RGB',(cols*w,rows*h),'white')
for i,f in enumerate(fs):
    im=Image.open(f'out/stills/f{f}.png').convert('RGB').resize((w,h))
    sheet.paste(im,((i%cols)*w,(i//cols)*h))
sheet.save(out)
